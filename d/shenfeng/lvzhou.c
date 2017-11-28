inherit ROOM;

void create()
{
        set("short", "沙漠绿洲");
        set("long", @LONG
你脚下的流沙已经不见，一个小小的湖泊呈现在你的眼前。
湖里的水虽然只有二指厚，却很清澈。在酷热的风中，湖水仍
是那么的清凉。一弯清流由北往南注入湖中。向西凝望，一座
雪白的山峰皎洁如玉。仰望峰巅，崇敬之心，油然而生。
LONG);
        set("outdoors", "shenfeng");
        set("exits", ([
  		"east" : __DIR__"shamo3",
  		"west" : __DIR__"xiaojing",
  		"north" : __DIR__"lake1",
	]));
        setup();
        replace_program(ROOM);
}
