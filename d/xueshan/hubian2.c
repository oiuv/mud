inherit ROOM;

void create()
{
        set("short", "湖边小路");
        set("long", @LONG
这是圣湖边的小路。长草越径，虫鸣阵阵，偶尔有白色水
禽掠湖点水，激起圈圈涟漪。
LONG );
        set("outdoors", "xuedao");
        set("exits", ([
                "east" : __DIR__"hubian3",
                "west" : __DIR__"hubian1",
        ]));
        setup();
        replace_program(ROOM);
}
