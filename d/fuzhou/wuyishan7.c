// Room: /d/fuzhou/wuyishan7.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "玉女峰");
	set("long", @LONG
玉女峰亭亭如少女玉立，突兀挺拔。峰顶花卉参簇，恰似山
花插鬓。岩壁秀润光滑，宛如玉肌清凉。俏立溪畔，凛然不可侵
犯，无路攀登。“插花临水一奇峰，玉骨冰肌处女容”即其写照。
峰下浴香潭，为玉女沐浴处。峰东圆石如镜，是为梳妆台。
LONG );
	set("exits", ([
		"north" : __DIR__"wuyishan2",
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

