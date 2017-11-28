//xizi.c

inherit NPC;

void create()
{
        set_name("戏子", ({"xi zi", "zi"}) );
        set("gender", "男性" );
        set("age", 25);
        set("long","一位装扮极为奇特的戏子。\n");
        set("combat_exp", 10000);
        set("str", 25);
        set("attitude","heroism");
        set_skill("dodge",80);
        setup();
        carry_object(__DIR__"obj/changpao")->wear();
        add_money("silver", 2);
}

void init()
{
        remove_call_out("says");
        call_out("says", random(3), this_object());
}

void says (object me)
{
        string *msgs = ({
        	"$N在台上走了几步。\n",
        	"$N高声唱着什么。\n",
        	"$N在空中使了一个花步，一个跟头翻了过来。\n",
        	"$N口中念念有词。\n",
        	"$N一个回身走向台角。\n",
        	"$N鞠了个躬。\n",
        	"$N翻了个空翻。\n",
        });
        message_vision (msgs[random(sizeof(msgs))],me);
        remove_call_out("says");
        call_out("says", random(40), me);
}
