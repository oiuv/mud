// Room: /qingcheng/yuanyangjing.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "鸳鸯井");
	set("long", @LONG
上清殿左有鸳鸯井，一方一圆，泉流暗通。圆者水浊，方者水
清。井水一温一凉，昔人题诗曰：“谁知上界神仙客，也与炎凉世
态同”。
LONG );
        set("outdoors","qingcheng");
        set("resource/water", 1);
	set("exits", ([
		"east"     : __DIR__"shangqing",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

