
type GreetingProps = {
  name: string;
};

export default function Greeting({ name }: GreetingProps) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>{name}</h1>
    </div>
  );
}
