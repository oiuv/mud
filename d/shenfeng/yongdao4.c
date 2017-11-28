inherit ROOM;

void create()
{
	set("short", "甬道");
	set("long", @LONG
一步跨进，脚下喀喇一声，踏碎了一堆枯骨。这是一条仅
可容身的狭长甬道，刀剑四散，到处都是骸骨。火光下只见门
后刀痕累累，斑驳凹凸。走完甬道，慢慢前行，跨过一堆堆白
骨，转了个弯，前面突然出现一座大殿。
LONG);
	set("exits", ([
		"east" : __DIR__"dadian",
		"south" : __DIR__"yongdao3",
	]));

        set("objects", ([
                __DIR__"obj/yufu" : random(2),
                __DIR__"obj/yudao" : random(2),
                __DIR__"obj/yujian" : random(2),
                __DIR__"obj/skeleton" : random(3) + 1,
        ]));

	setup();
	replace_program(ROOM);
}
