// Room: /d/shaolin/gulou6.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "鼓楼六层");
	set("long", @LONG
沿窗洞吹进一阵阵凌厉的山风，寒意浸人。北望可见松林的
尽头，少室山的顶峰处，有一片小小的平地，正中植着三棵巨松；
中间又似乎有什么东西正闪闪发光。楼上传来一阵阵沉闷的鼓声。
LONG );
	set("exits", ([
		"up" : __DIR__"gulou7",
		"down" : __DIR__"gulou5",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

