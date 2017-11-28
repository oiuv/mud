inherit ROOM;

void create()
{
        set("short", "花厅");
        set("long", @LONG
这里是一个幽雅别致的花厅，四周挂着碧纱的幔帐，屋角香炉中
飘着一股奇异的香气。有一个粉红衣裙的少女正坐在窗边发呆，听见
脚步声不觉瞟了你一样，秀眉微微一颦，似乎不太高兴。
LONG);

        set("exits", ([
                "south" : __DIR__"huating2",
                "west" : __DIR__"huayuan1",
                "north" : __DIR__"huating3",
        ]));
        set("objects", ([
                CLASS_D("wudu") + "/hetieshou" : 1,
        ]));

        setup();
        //replace_program(ROOM);
}
