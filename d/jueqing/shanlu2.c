inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
到得此处，一路上已是风物佳胜。只见路旁仙鹤三二、白
鹿成群，松鼠小兔，尽是见人不惊。偶尔闻到阵阵的花香，又
见道旁白兔、小鹿来去奔跃，甚是可爱，令人心旷神怡。
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "northeast"   : __DIR__"zhulin1",
               "southdown"   : __DIR__"shanlu1",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
