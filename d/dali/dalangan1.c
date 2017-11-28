inherit ROOM;

void create()
{
        set("short", "大杆栏");
        set("long", @LONG
依着一棵大榕树，摆夷人在此建了一座相当大的杆栏。下
层这里有一满圈的十几头牛羊。旁边的楼梯修得颇宽。看来这
里是本地的体面人家。
LONG);
        set("objects", ([
                "/clone/quarry/yang2" : 2,
        ]));
        set("outdoors", "dali");
        set("exits", ([
                "west" : __DIR__"nongtian4",
                "up"   : __DIR__"dalangan2",
        ]));
        setup();
        replace_program(ROOM);
}
