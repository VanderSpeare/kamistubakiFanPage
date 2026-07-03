import { usePremiereVideo } from "../components/premiereVideoSession";

export default function VideoSection() {
  const { openVideo } = usePremiereVideo();

  return (
    <section className="py-32 flex justify-center">
      <div
        className="video-wrapper cursor-pointer"
        onClick={() => openVideo("VMkIQ3gD494")}
      >
        <iframe
          src="https://www.youtube.com/embed/VMkIQ3gD494?mute=1"
          className="w-full aspect-video rounded-2xl"
          allowFullScreen
        />
      </div>
    </section>
  );
}
