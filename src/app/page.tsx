import Link from "next/link";
import { getMyUploads } from "~/server/queries";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import FileUploadForm from "~/components/FileUploadForm";

// Helper function to format dates in a readable way
function formatDate(dateString: string | Date): string {
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  
  // Get time difference in milliseconds
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Convert to different units
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Format based on time difference
  if (diffSecs < 60) {
    return 'just now';
  }
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  
  // Format as date for older items
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default async function FilesPage() {
  const uploads = await getMyUploads();

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Files</h1>
      </div>

      <SignedOut>
        <div className="bg-amber-100 border border-amber-400 text-amber-800 p-4 rounded mb-6">
          <p>Please sign in to view your files.</p>
        </div>
      </SignedOut>

      <SignedIn>
        {/* File Upload Form */}
        <FileUploadForm />
        
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">My Uploads</h2>
          
          {uploads.length === 0 ? (
            <div className="bg-slate-100 p-8 rounded-lg text-center">
              <h2 className="text-xl font-medium mb-2">No files uploaded yet</h2>
              <p className="text-slate-600 mb-4">
                Use the upload form above to add your first file
              </p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploads.map((file) => (
                    <tr key={file.uuid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {file.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {file.fileType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(file.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/files/${file.uuid}`}
                          className="text-purple-600 hover:text-purple-900 mr-4"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SignedIn>
    </main>
  );
}
