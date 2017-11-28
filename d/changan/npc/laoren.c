//laoren.c

inherit NPC;

void create()
{
        set_name("说书老人", ({"shuoshu laoren", "laoren"}) );
        set("gender", "男性" );
        set("age", 53);
        set("long","一位慈眉善目的老人，正在说书。\n");
        set("combat_exp", 6000);
        set("str", 30);
        set("attitude","heroism");

        setup();
        carry_object(__DIR__"obj/changpao")->wear();
        add_money("silver", 10);
}

void init()
{
        remove_call_out ("says");
        call_out("says", random(3), this_object());
}

void says(object me)
{
        string *msgs = ({
        	"$N绘声绘色地说着书。\n",
        	"$N滔滔不绝地说着书。\n",
        	"$N说得眉飞色舞。\n",
        	"$N说道：“欲知后事如何，且听下回分解。”\n",
        	"$N端起茶碗喝了几口茶水，又开始接着说书。\n",
        });
        message_vision (msgs[random(sizeof(msgs))], me);
        remove_call_out("says");
        call_out("says",random(40),me);
}
