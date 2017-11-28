inherit NPC;

void destroying(object, object);

void create()
{
        set_name("菊友", ({ "juyou" }));
        set("long", 
                "她是一个长得很好看的小姑娘，正在忙着浇一盆菊花。\n");
        set("title","丫鬟");
        set("gender", "女性");
        set("age", 15);

        set_skill("unarmed", 20);
        set_skill("dodge", 20);
        set_skill("parry", 20);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
        set_temp("apply/damage", 5);

        set("combat_exp", 3000);
        set("shen_type", 1);
        setup();
        carry_object("/d/city/obj/pink_cloth")->wear();

}

int accept_object(object me, object obj)
{
object key;
        if ((string)obj->query("id")=="ye juhua") {
        message("vision",me->name()+"给菊友一朵野菊花。\n",environment(me),
            ({me}));
        command("ah "+me->query("id"));
        command("say 想不到这位"+RANK_D->query_respect(me)+"也是个爱菊花的人。");
        key = new(__DIR__"obj/gfkey");
        key->move(me);
        message_vision("$n递给$N一把钥匙。\n", me, this_object() );
        command("say 想必你也没见过绿菊花罢。我家小姐闺房后面种了有，你可以去看看。");
        remove_call_out("destroying");
        call_out("destroying", 1, this_object(), obj);
        return 1;
        }
        return 0;
}

void destroying(object me,object obj)
{
        destruct(obj);
        return;
}

