inherit ROOM;

void create()
{
        set("short", "潇湘馆");
        set("long",@LONG
这是缥缈峰灵鹫宫的裁缝室。几个女子围坐在一块，飞针
走线，苦练女红，为灵鹫宫的诸多女弟子缝纫青衣斗篷。 
LONG);
        set("exits", ([
                "south" : __DIR__"changl10",
        ]));
        set("objects",([
                CLASS_D("lingjiu") + "/fumingyi" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
