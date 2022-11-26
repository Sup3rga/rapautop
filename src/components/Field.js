import React from 'react';

export default class Field extends React.Component{

    render() {
        let {placeholder,type,options,children, onChange} = this.props;
        type = type || 'text';
        options = options || {}
        let field = null;
        console.log('[children]',type,children);
        switch (type){
            case 'select':
                field = (
                    <select
                        className="ui-element ui-size-fluid"
                        placeholder={placeholder}
                        onChange={onChange}
                    >
                        {children ? children :
                            Object.keys(options).map((value,index)=>{
                                return <option value={value}>{options[value]}</option>
                            })
                        }
                    </select>
                );
            break;
            case 'textarea':
                field = (
                    <textarea
                        className="ui-element ui-size-fluid"
                        placeholder={placeholder}
                        onChange={onChange}
                    >
                        {children}
                    </textarea>
                );
            break;
            default:
                field = (
                    <input className="ui-element ui-size-fluid"
                           placeholder={placeholder || ''}
                           type={type || 'text'}
                           onChange={onChange}
                    />
                );
        }
        return (
            <div className={
                "ui-container ui-field " + this.props.className
            }>
                {field}
            </div>
        );
    }
}