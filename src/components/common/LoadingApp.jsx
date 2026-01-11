

const LoadingApp = () => {
  return (
    <>
    <div className="min-h-screen overflow-hidden flex items-center justify-center">
          <div className="flex items-center justify-center flex-col gap-y-2">
            <div className="loader"></div>
            <small className="text-slate-500 italic">
              Getting your stats… just a moment!
            </small>
          </div>
        </div>
    </>
  )
}

export default LoadingApp