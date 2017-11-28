inherit ROOM;

void create()
{
        set("short", "大厅");
        set("long", @LONG
这里是个宽广的大厅，高大的盘龙柱一人都合抱不过来。这里是
平日教主召集教众们议事的地方，大厅正中供奉着五圣--毒蛇，蜘蛛，
蜈蚣，蝎子蟾蜍的画像。几位长老正坐在厅中议事 。
LONG);
        set("exits", ([
                "east" : __DIR__"huayuan1",
                "south" : __DIR__"jingshi",
                "west" : __DIR__"lianwu",
                "north" : __DIR__"shufang",
        ]));
        set("objects", ([
               CLASS_D("wudu") + "/qiyunao" : 1,
               CLASS_D("wudu") + "/panxiuda" : 1,
               CLASS_D("wudu") + "/cenqisi" : 1,
        ]));

        set("valid_startroom", 1);
        setup();
        "/clone/board/wudu_b"->foo();
}
