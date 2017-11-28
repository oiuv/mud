inherit ROOM;

void create()
{
        set("short", "显真堂");
        set("long", @LONG
这里是大堂旁边的侧厅，也是接待重要客人的地方。厅不
大，只摆放着一张桌子和几把椅子。桌上摆放着一盆高山流水
的盆景，墙壁上挂着一些字画。西面有一间药剂室。
LONG);
        set("exits", ([
                "east" : __DIR__"piandian",
                "west" : __DIR__"yaojishi",
                "north" : __DIR__"datang1",
                "south" : __DIR__"rongwutang",
        ]));
        set("objects",([
              CLASS_D("quanzhen") + "/zhang" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
