/* buildingd.c 建築物精靈
   write by -Acme- 2009.03.27
*/

void create() { seteuid(getuid()); }

string getRoomCode() {
    string code;

////////////////////////
// start ROOM CODE
////////////////////////
    code = @ROOM_CODE
// created by BUILDING_D

inherit BUILD;

ROOM_CODE;
////////////////////////
// edit ROOM CODE
////////////////////////

    return code;
}

string getAreaCode(int x, int y) {
    string code;

////////////////////////
// start AREA CODE
////////////////////////
    code = @AREA_CODE
// created by BUILDING_D

inherit AREA_BUILD;

void create()
{
    set("name", "空地");

AREA_CODE;

    code += "    set(\"x_axis_size\", " + x + ");\n";
    code += "    set(\"y_axis_size\", " + y + ");\n";
    code += @AREA_CODE

    setup();
}
AREA_CODE;
////////////////////////
// edit AREA CODE
////////////////////////

    return code;
}
