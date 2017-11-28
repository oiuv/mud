inherit ROOM;

void create()
{
        set("short", "梳妆台");
        set("long", @LONG
藏经殿有一泓碧泉如镜，向称美容泉。相传为南陈后主妃
在此避乱时，对碧水照容颜梳妆打扮的地方。殿前胜迹有灵日，
昔时夜间常见飞光，或如繁星点点，或若万萤乱飞，煞是壮观。
LONG);
        set("exits", ([ 
               "north"   : __DIR__"cangjingdian",
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

