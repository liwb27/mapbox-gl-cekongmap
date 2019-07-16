

module.exports = function (modalID, headerText='') {
    var modal = document.createElement('div');
    modal.className = "modal show";
    modal.id = modalID;
    
    var tmp = document.createElement('div');
    tmp.className = "modal-dialog modal-lg";
    modal.appendChild(tmp);
    var tmp2 = document.createElement('div');
    tmp2.className = "modal-content";
    tmp.appendChild(tmp2);
    
    var header = document.createElement('div');
    header.className = "modal-header";
    var btnx = document.createElement('button');
    btnx.type = "button";
    btnx.className = "close md-close";
    btnx['data-dismiss']="modal";
    btnx.innerText = 'x';
    btnx.onclick = function () {
        document.body.removeChild(modal);
    }
    header.appendChild(btnx);
    var title = document.createElement('h4');
    title.className = "modal-title";
    // title.id = 'hideLoadDrawElement';
    title.innerText = headerText;
    header.appendChild(title);
    tmp2.appendChild(header);
    
    var modalbody = document.createElement('div');
    modalbody.className = "modal-body";
    tmp2.appendChild(modalbody);

    var footer = document.createElement('div');
    footer.className = 'modal-footer';
    var btn = document.createElement('button');
    btn.type = "button";
    btn.className = "btn btn-default btn-flat md-close";
    btn.innerText = '取消';
    btn.onclick = function () {
        document.body.removeChild(modal);
    }
    footer.appendChild(btn);
    var btnAccept = document.createElement('button');
    btnAccept.type = "button";
    btnAccept.className = "btn btn-primary btn-flat md-close";
    btnAccept.innerText = '确定';
    btnAccept.onclick = function () {
        document.body.removeChild(modal);
    }
    footer.appendChild(btnAccept);
    tmp2.appendChild(footer);

    document.body.appendChild(modal);

    return modal;
}