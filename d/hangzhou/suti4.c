inherit ROOM;

void create()
{
        set("short", "苏堤");
        set("long", @LONG
春晓，漫步林荫道上，烟柳笼纱，雀鸟欢鸣一片生机。苏
堤春晓被列为西湖十景之首，果然名不虚传。北边是压堤桥南
面是望山桥。东面一片梅林，林后似乎有座院落，但看不真切。
LONG);
        set("exits", ([
            	"north" : __DIR__"suti3",
            	"south" : __DIR__"suti5",
        ]));
        set("objects", ([
            	__DIR__"npc/liyuanzhi" : 1,
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
