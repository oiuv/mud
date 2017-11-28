
inherit ROOM;

void create()
{
        set("short", "普光寺");
        set("long", @LONG
这是一个位於终南山下的小寺庙，庙门横额写着 "普光寺" 
三个大字。由於此庙是上终南山的必经之路，大多数的游客都
会在此落脚休息，也因此此处香火也颇为鼎盛。庙前的几株松
树下，立着一块石碑(shibei)，几乎快被周围的长草给遮掩了。
往西走是一条小路.
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "west" : __DIR__"shanlu13",
        ]));

        setup();
        replace_program(ROOM);
}
