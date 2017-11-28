inherit ROOM;

void create()
{
        set("short", "旁厅");
        set("long", @LONG
一个小小的休息室，没什么东西。你走到这里只想躺下好
好休息一下。床头柜上有小二沏好的浓茶。
LONG);
        set("exits", ([
                "east" : __DIR__"yinghaoup",
                
        ]));
        setup();
        replace_program(ROOM);
}
