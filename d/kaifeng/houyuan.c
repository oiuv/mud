inherit ROOM;

void create()
{
        set("short", "后院");
        set("long", @LONG
后院之中绿荫如云。许多树木下设有石凳，供人休息。正
中的一个大铁香炉中香烟袅袅，许愿的人们多有在此磕头。东
面是藏经楼。西面是千手千眼佛殿。北面是八宝琉璃殿。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"qianshou",
  		"east" : __DIR__"cangjing",
  		"north" : __DIR__"8bao",
  		"south" : __DIR__"daxiong",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
