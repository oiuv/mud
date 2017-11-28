inherit ROOM;

void create()
{
        set("short", "方丈室");
        set("long", @LONG
方丈室内的陈设相对来说比较简单，正中的墙面上写着个
大大的『佛』字。地上铺着一张大席子，一张矮几就放在席子
中间。两边是两个锦垫。在靠里面的地方，有个蒲团，边上是
个小木鱼，据说方丈大师每天只需打坐片刻就精力充沛。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"xiaoyuan",
	]));
        set("objects", ([
  		__DIR__"npc/zhiqing" : 1,
	]));

        setup();
        replace_program(ROOM);
}
