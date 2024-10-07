import React, { CSSProperties } from 'react';

/** Propsの型定義 */
interface PropsType {
  style?: CSSProperties;
}

const HorizontalLinegold = (props: PropsType) => {
  const defaultStyle = {
    width: "90%",
    height: "1px" ,
    backgroundColor: "#e6b422" ,
  } as CSSProperties;

  return <div style={props.style ? props.style : defaultStyle}></div>;
};

const HorizontalLinesilber = (props: PropsType) => {
    const defaultStyle = {
      width: "90%" ,
      height: "1px",
      backgroundColor: "#808080",
    } as CSSProperties;
  
    return <div style={props.style ? props.style : defaultStyle}></div>;
  };

  const HorizontalLinebronze = (props: PropsType) => {
    const defaultStyle = {
      width: "90%",
      height: "1px",
      backgroundColor: "#8c4841",
    } as CSSProperties;
  
    return <div style={props.style ? props.style : defaultStyle}></div>;
  };


export default [HorizontalLinegold,HorizontalLinesilber, HorizontalLinebronze
]