inherit ROOM;

void create()
{
        set("short", "王府正厅");
        set("long", @LONG
这里是平西王府的正厅，正中两把太师椅，墙上挂着一幅
字画，布置的简单清洁。这里空荡荡的没有一个人，看来平西
王平时极少来这里，只有几个下人不时来打扫一下。
LONG);
        set("exits", ([
                "south"    :__DIR__"wangfu1",
        ]));

        setup();
        replace_program(ROOM);         
}
