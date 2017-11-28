inherit ROOM;

void create()
{
  	set ("short", "中州道");
  	set ("long", @LONG
这条笔直的大路是连接南北的交通要道，南面通向神州重
地中州城。向北是条渡口路，通向长江。过了江就是扬州了。
LONG);

  	set("outdoors", "zhongzhou");
  	set("exits", ([
  		"south" : __DIR__"to_zhongzhou2",
  		"north":__DIR__"dukoulu",
	]));
  	setup();
}
