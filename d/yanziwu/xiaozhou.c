// Room: /d/yanziwu/xiaozhou.c
// Date: Feb.14.1998 by Java

inherit ROOM;
void create()
{
	set("short", "小舟");
	set("long", @LONG
碧绿湖面飘荡的一叶小舟，一个绿衫少女手执双桨，缓缓
划水，口中唱着吴侬小曲。歌声娇柔无那，欢悦动心。一双纤
手皓肤如玉，映着绿波，便如透明一般。
LONG );
	set("outdoors", "yanziwu");
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

