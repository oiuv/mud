//Room: xian-daokou.c

inherit ROOM;
void create ()
{
        set ("short", "西安道口");
        set ("long", @LONG
长安城自古是繁华胜地，为数代皇朝建都之地，又为盐商大贾所聚
集，殷富甲于天下。西安道口是一个四通八达的路口，东方有一条大路
通往扶风道，西面是长安西城门，南北方向是永泰大道。 
LONG);
        set("exits",([//sizeof() == 5
        	"south" : __DIR__"yongtai-dadao4",
        	"north" : __DIR__"yongtai-dadao3",
        	"west" : __DIR__"xi-chengmen",
        	"east" : __DIR__"xian-dadao",
        	"southeast" : __DIR__"bingying3",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
        