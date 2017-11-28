inherit ROOM;

void create()
{
        set("short", "吊篮");
        set("long", @LONG
这是一只大竹篓，足可装得十来石米。抬头上望，只见头
顶有天风崖壁，这黑木崖着实高得厉害。
LONG);
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
