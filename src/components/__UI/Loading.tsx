type Props = {
  label: string;
};

const Loading = ({ label }: Props) => {
  return (
    <div className="py-40 text-center">
      <p className="text-2xl text-white">{label}</p>
    </div>
  );
};

export default Loading;
