interface TitleProps {
    title: string;
}

const Title = (props: TitleProps) => {

    const style: React.CSSProperties = {
        fontSize: '8em',
        fontWeight: 800,
        color: '#fff',
        textAlign: 'center',
        textShadow: '0 0 15px #00000080',
        marginTop: '2.5%',
        marginBottom: '1.5%',
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