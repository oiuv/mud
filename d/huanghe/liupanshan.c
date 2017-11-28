// Room: /huanghe/liupanshan.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "六盘山");
	set("long", @LONG
这是一座不太高的小山。山顶望去，瓦蓝的天空(sky)飘着几朵淡淡
的白云。一群大雁发出「嘎嘎」的叫声，从头上飞过。西面山下长城的残
垣断壁依稀可辨。路旁有一处悬崖之上刻着首词(poem)。北边山下是永登
城，东面山下是一处小村庄。
LONG );
	set("exits", ([
		"northdown" : __DIR__"yongdeng",
		"eastdown"  : "/d/village/wexit",
	]));
	set("item_desc", ([
		"poem" : "
崖壁上刻着一首清平乐：

  何  今  红  六  屈  不  望  天
  时  日  旗  盘  指  到  断  高
  缚  长  漫  山  行  长  南  云
  得  缨  卷  上  程  城  飞  淡
  苍  在  西  高  二  非  雁
  龙  手  风  峰  万  好
                      汉

你现在是好汉了！
\n",
	]));
	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

