inherit ROOM;

void create()
{
        set("short", "东大殿");
        set("long", @LONG
每一间房中大都供有佛像。偶然在壁上见到几个汉文，写
的是高昌国国王，文泰，大唐贞观十三年等等字样。有一座殿
堂中供的都是汉人塑像，匾上写着大成至圣先师孔子位，左右
各有数十人，写着颜回、子路、子贡、子夏、子张等名字。
LONG);
        set("exits", ([ 
                "south" : __DIR__"eroom2",
                "northeast" : __DIR__"zoulange",
        ]));
        set("maze", 1);
        setup();
        replace_program(ROOM);
}
