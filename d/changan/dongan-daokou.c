//Room: dongan-daokou.c

inherit ROOM;
void create ()
{
        set ("short", "东安道口");
        set ("long", @LONG
长安城自古是繁华胜地，为数代皇朝建都之地，又为盐商大贾所聚
集，殷富甲于天下。东安道口是一个四通八达的路口，西方有一条大路
通往冯诩道，东面是长安东城门，南北方向是连德大道。 
LONG);
        set("exits",([//sizeof() == 5
        	"south" : __DIR__"liande-dadao4",
        	"north" : __DIR__"liande-dadao3",
        	"west" : __DIR__"dongan-dadao",
        	"east" : __DIR__"dong-chengmen",
        	"southwest" : __DIR__"bingying6",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
        