import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, ExternalLink } from "lucide-react";

export default function Map() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to={createPageUrl("Home")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-xl font-semibold text-slate-900">Israeli Tech Map</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a 
                href="https://maphub.net/mluggy/techmap" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in MapHub
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Map iframe */}
      <div className="flex-1 relative">
        <iframe
          src="https://maphub.net/embed_h/mluggy/techmap?panel=1&panel_closed=1"
          title="Israeli Tech Map"
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}
