
interface CompletedButtonProps {
  onClick: () => void;
}

export default function CompletedButton(props: CompletedButtonProps) {

  const style: React.CSSProperties = {
    fontSize: 'min(2em, 6vw)',
    fontWeight: '700',
    position: 'absolute',
    bottom: '.5em',
    right: '.5em',
    color: '#FFF',
    textShadow: '0 0 15px #00000050',
    backgroundColor: '#00000040',
    padding: '0.4em 0.5em',
    borderRadius: '0.5em',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
  };

  return (
    <button 
      onClick={props.onClick}
      style={style}
      className='completed-button'>
        <i className="fa-solid fa-check"></i>
    </button>
  )
}
