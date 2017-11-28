inherit ROOM;

void create()
{
  	set ("short", "中州道");
  	set ("long", @LONG
这是条连接南北的交通要道，来往行人不断。道旁的树木
下多有作小生意的商人。向南是中州城，北面通向扬州。
LONG);

  	set("outdoors", "zhongzhou");
  	set("exits", ([
  		"south" : __DIR__"to_zhongzhou3",
  		"north" : __DIR__"to_zhongzhou",
	]));

  	setup();
}
