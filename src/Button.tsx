type ButtonProps ={
   onclick: () => void;
};


export default function Button({ onclick }: ButtonProps) {
    return (
        <button onClick={onclick}>Clique aqui</button>
    );
}


