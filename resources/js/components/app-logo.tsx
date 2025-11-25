export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                <img 
                    src="/usep-logo.png" 
                    alt="USeP Logo" 
                    className="w-8 h-8 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    CyberSafe USeP
                </span>
            </div>
        </>
    );
}