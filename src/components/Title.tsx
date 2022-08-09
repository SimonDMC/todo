interface TitleProps {
    title: string;
}

const Title = (props: TitleProps) => {

    const style: React.CSSProperties = {
        fontSize: 'min(8em, 30vw)',
        fontWeight: 800,
        color: '#fff',
        textAlign: 'center',
        textShadow: '0 0 15px #00000080',
        marginTop: '5vh',
        marginBottom: '3vh',
    }

    return (
            <h1
            className="title"
            style={style}>
                {props.title}
            </h1>
    );
}

export default Title;