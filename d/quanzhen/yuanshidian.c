inherit ROOM;

void create()
{
        set("short", "元始殿");
        set("long", @LONG
这里是供奉元始天尊的大殿。殿内香烟缭绕，正中央塑着
元始天尊的金身，旁边还塑着几位道友如太乙、俱留孙、云中
子、广成子等等的像，正聚在一处或躺或坐，或棋或茶。
LONG);
        set("exits", ([
                "south" : __DIR__"laojundian",
        ]));
        set("objects", ([
                CLASS_D("quanzhen") + "/qi" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
