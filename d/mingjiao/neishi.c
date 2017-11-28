//room: /d/mingjiao/neishi.c
inherit ROOM;

void create()
{
        set("short","明教内室");
        set("long", @LONG
这里是明教内室。小小桌前的窗外，望出去是连绵万里的巍巍昆
仑。窗棂门扇均雕制得美仑美奂，精巧异常桌前端坐一个亮丽女孩，
你乍一见惊异她的美貌，不禁轻轻叫出声来。
LONG );
        set("exits",([
            "out"    : __DIR__"dadian",
            "enter"  : __DIR__"didao1",
        ]));
        set("no_fight","1");
        set("no_beg","1");
        set("objects",([
            CLASS_D("mingjiao")+"/xiaozhao":1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
