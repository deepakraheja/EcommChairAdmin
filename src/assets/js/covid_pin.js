function getPostOffice() {
    debugger
    var val = $('#dest_addr_pin')[0].value;

    if (val.length == 6) {
        $('#dest_addr_city')[0].value = "";
        $("#cityLst option").eq(0).remove();
        $('#dest_post_office')[0].value = "";
        $("#postOfficeLst option").eq(0).remove();
        city_code = "<option value=''> Select City* </option>";
        $('#cityLst').html(city_code);
        po_code = "<option value=''> Select PostOffice* </option>";
        $('#postOfficeLst').html(po_code);
        load_data(val);

    } else {
        console.log('pincode should be 6 digits');
    }
}

function load_data(pin) {
    $.ajax({
        url: "https://api.postalpincode.in/pincode/" + pin,
        method: "GET",
        success: function(data) {
            debugger
            if (data[0].PostOffice != "") {
                $('#dest_addr_state')[0].value = (data[0].PostOffice[0].State).toUpperCase();

                //len = data.length;
                city_code = '';
                var cname;
                debugger
                let array = data[0].PostOffice;
                const result = [];
                const map = new Map();
                for (const item of array) {
                    if (!map.has(item.District)) {
                        map.set(item.District, true); // set any value to Map
                        result.push({
                            District: item.District
                        });
                    }
                }
                $.each(result, function() {
                    city_code += "<option value='" + this.District + "'> " + this.District + "</option>";
                    cname = this.District;
                });
                $('#cityLst').html(city_code);
                po_code = '';
                $.each(data[0].PostOffice, function() {
                    if (this.BranchType == "Sub Post Office") {
                        debugger
                        if (this.Name.split(' (').length > 1) {
                            var po = this.Name.split(' (')[0] + " S.O (" + this.Name.split(' (')[1];
                            po_code += "<option value='" + po + "'> " + po + "</option>";
                        } else
                            po_code += "<option value='" + this.Name + " S.O'> " + this.Name + " S.O</option>";
                    }
                    if (this.BranchType == "Head Post Office") {
                        if (this.Name.split(' (').length > 1) {
                            var po = this.Name.split(' (')[0] + " H.O (" + this.Name.split(' (')[1];
                            po_code += "<option value='" + po + "'> " + po + "</option>";
                        } else
                            po_code += "<option value='" + this.Name + " H.O'> " + this.Name + " H.O</option>";
                    }
                    if (this.BranchType == "Branch Post Office") {
                        if (this.Name.split(' (').length > 1) {
                            var po = this.Name.split(' (')[0] + " B.O (" + this.Name.split(' (')[1];
                            po_code += "<option value='" + po + "'> " + po + "</option>";
                        } else
                            po_code += "<option value='" + this.Name + " B.O'> " + this.Name + " B.O</option>";
                    }
                });
                $('#postOfficeLst').html(po_code);
            }
        }
    })
}


function load_PostOffice() {
    var pin = $('#dest_addr_pin')[0].value;
    var city = $('#dest_addr_city')[0].value;
    $('#dest_post_office')[0].value = "";
    $("#postOfficeLst option").eq(0).remove();
    $.ajax({
        url: "https://api.postalpincode.in/pincode/" + pin,
        method: "GET",
        success: function(data) {
            debugger
            if (data[0].PostOffice != "") {
                //$('#dest_addr_state')[0].value = (data[0].PostOffice[0].State).toUpperCase();
                debugger
                po_code = '';
                $.each(data[0].PostOffice, function() {
                    if (this.District == city) {
                        if (this.BranchType == "Sub Post Office") {
                            debugger
                            if (this.Name.split(' (').length > 1) {
                                var po = this.Name.split(' (')[0] + " S.O (" + this.Name.split(' (')[1];
                                po_code += "<option value='" + po + "'> " + po + "</option>";
                            } else
                                po_code += "<option value='" + this.Name + " S.O'> " + this.Name + " S.O</option>";
                        }
                        if (this.BranchType == "Head Post Office") {
                            if (this.Name.split(' (').length > 1) {
                                var po = this.Name.split(' (')[0] + " H.O (" + this.Name.split(' (')[1];
                                po_code += "<option value='" + po + "'> " + po + "</option>";
                            } else
                                po_code += "<option value='" + this.Name + " H.O'> " + this.Name + " H.O</option>";
                        }
                        if (this.BranchType == "Branch Post Office") {
                            if (this.Name.split(' (').length > 1) {
                                var po = this.Name.split(' (')[0] + " B.O (" + this.Name.split(' (')[1];
                                po_code += "<option value='" + po + "'> " + po + "</option>";
                            } else
                                po_code += "<option value='" + this.Name + " B.O'> " + this.Name + " B.O</option>";
                        }
                    }
                });
                $('#postOfficeLst').html(po_code);
            }
        }
    })
}