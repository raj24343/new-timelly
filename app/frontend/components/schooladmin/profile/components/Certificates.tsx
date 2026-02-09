import { Award, Download } from "lucide-react";

type Certificate = {
  id: string;
  title: string;
  issuedDate: string;
  issuedBy: string | null;
  certificateUrl: string | null;
};

// Dummy data for visualization
const DUMMY_DATA: Certificate[] = [
  {
    id: "1",
    title: "Academic Excellence Award",
    issuedDate: "2023-12-01",
    issuedBy: "School Board",
    certificateUrl: "#"
  },
  {
    id: "2",
    title: "Inter-School Sports Winner",
    issuedDate: "2024-01-15",
    issuedBy: "Sports Authority",
    certificateUrl: "#"
  }
];

type Props = {
  certificates?: Certificate[];
};

export const Certificates = ({ certificates }: Props) => {
  // Use dummy data if the passed array is empty or missing
  const displayData = certificates && certificates.length > 0 ? certificates : DUMMY_DATA;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
      <h3 className="text-xl font-semibold flex items-center gap-3 mb-10 text-white">
        <Award className="w-6 h-6 text-[#b4f44d]" />
        Certificates
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayData.map((c) => (
          <div
            key={c.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex justify-between items-center transition-all hover:bg-white/10"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-[#b4f44d]/10 rounded-xl flex items-center justify-center text-[#b4f44d]">
                <Award size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-white leading-tight">{c.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Issued on {new Date(c.issuedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <a
              href={c.certificateUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#b4f44d] p-2 transition-colors"
              aria-label="Download"
            >
              <Download size={20} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};