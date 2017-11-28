//Room: nanan-daokou.c

inherit ROOM;

void create ()
{
        set ("short", "南安道口");
        set ("long", @LONG
长安城自古是繁华胜地，为数代皇朝建都之地，又为盐商大贾所聚
集，殷富甲于天下。南安道口是一个四通八达的路口，东西方向通往华
瑞街，南面是长安南城门，北方有一条大路通到故皇宫的金水桥。 
LONG);
        set("exits",([//sizeof() == 4
        	"south" : __DIR__"nan-chengmen",
        	"north" : __DIR__"nanan-dadao",
        	"west" : __DIR__"huarui3",
        	"east" : __DIR__"huarui4",
        	"northeast" : __DIR__"bingying4",
        	"northwest" : __DIR__"bingying5",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
        