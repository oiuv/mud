// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "一天门");
	set("long", @LONG
从岱宗坊上山大约走四里，便来到一天门。北面有一座天阶坊，过
了此坊便进入了登泰山的盘道。南面有一座更衣亭，士大夫们及其
随从，都会在这里换上轻便的服装，才继续登山。从一天门向北眺
望，南天门与十八盘在云雾明灭间或隐或现，登泰山的人到此已有
观止之叹。附近有一牌坊，上写「孔子登临处」，相传为「孔子过
泰山侧」的故事发生的地方。
LONG );
	set("exits", ([
		"northup" : __DIR__"doumo",
		"southdown" : __DIR__"baihe",
	]));
	set("objects",([
		__DIR__"npc/dao-ke" : 1,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "taishan");
	setup();
	replace_program(ROOM);
}

