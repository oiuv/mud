inherit ROOM;

void create()
{
        set("short", "蓼风轩");
        set("long", @LONG
这是灵鹫宫弟子的兵器库，你环顾四周，发现墙上嵌满了
各式兵器，仔细一看，原来满墙满壁竟随依各般兵器之形抠出
槽子，兵刃就悬于槽内。
LONG);
        set("exits", ([
                "east" : __DIR__"changl5",
        ]));
        set("objects",([
                "/d/village/obj/zhujian" : 4,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
