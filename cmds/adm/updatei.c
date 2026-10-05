// updatei.c -- 按实体继承顺序更新，再重建已加载的虚拟蓝图。
#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

private int update_one(string target, int detail) {
    object ob, env, safe, item;
    object *moves;
    mixed err;

    moves = ({});
    ob = find_object(target);
    if (ob) {
        env = environment(ob);
        if (sizeof(filter_array(deep_inventory(ob), (: userp($1) || playerp($1) :)))) {
            err = catch(safe = load_object(VOID_OB));
            if (err || !objectp(safe)) {
                write("无法加载安全临时地点，保留原对象：" + target + "。\n");
                return 0;
            }
            moves = all_inventory(ob);
            foreach (item in moves) {
                if (!objectp(item)) continue;
                err = catch(item->move(safe, 1));
                if (err || !objectp(item) || environment(item) != safe) {
                    write("迁出失败，保留原对象：" + target + "；已迁出内容仍在安全临时地点。\n");
                    return 0;
                }
            }
            if (sizeof(filter_array(deep_inventory(ob), (: userp($1) || playerp($1) :)))) {
                write("仍有玩家未迁出，保留原对象：" + target + "。\n");
                return 0;
            }
        }
        err = catch(destruct(ob));
        if (err || objectp(ob)) {
            write("无法销毁原对象：" + target + "；已迁出内容尚未恢复。\n");
            return 0;
        }
    }
    err = catch(ob = load_object(target));
    if (err || !objectp(ob)) {
        write(HIR "编译失败：" + target + "。\n" NOR);
        if (stringp(err)) write(err);
        if (sizeof(moves)) write("已迁出内容仍在安全临时地点，尚未恢复。\n");
        return 0;
    }
    if (objectp(env) && environment(ob) != env) {
        err = catch(ob->move(env));
        if (err || !objectp(ob) || environment(ob) != env) {
            write("已加载但原位置恢复失败：" + target + "；已迁出内容尚未恢复。\n");
            return 0;
        }
    }
    foreach (item in moves) {
        if (!objectp(item)) continue;
        err = catch(item->move(ob, 1));
        if (err || !objectp(item) || !objectp(ob) || environment(item) != ob) {
            write("已加载但房间内容恢复失败：" + target + "；未恢复内容仍在安全临时地点。\n");
            return 0;
        }
    }
    if (detail) write("编译 " + target + "：成功！\n");
    return 1;
}

int main(object me, string arg) {
    string file, name, target, option;
    string *pending, *ready, *ordered, *virtuals;
    object ob;
    object *obs;
    mapping sources, dependencies;
    int opt_compile, opt_detail, opt_force, count;

    if (!SECURITY_D->valid_grant(me, "(admin)")) return 0;
    seteuid(geteuid(me));
    if (!arg) return notify_fail("指令格式：updatei <实体源码> [-c] [-d] [-f]\n");
    foreach (option in explode(arg, " ")) {
        switch (option) {
            case "-c": opt_compile = 1; break;
            case "-d": opt_detail = 1; break;
            case "-f": opt_force = 1; break;
            default: file = resolve_path(me->query("cwd"), option);
        }
    }
    if (!file) return notify_fail("必须指明实体继承源码，不能只输入选项。\n");
    target = lpc_file(file);
    if (!target || lpc_object_path(target) == target)
        return notify_fail("没有可更新的实体 LPC 源码：" + file + "。\n");
    file = target;
    name = lpc_object_path(file);
    ob = find_object(name);
    if (name == VOID_OB || name == TEMP_OB || (ob && (userp(ob) || playerp(ob))))
        return notify_fail("安全临时地点或玩家对象不能作为更新根。\n");
    me->set("cwf", file);
    obs = filter_array(objects(), (: inherits($(file), $1) && !userp($1) &&
        !playerp($1) && !clonep($1) :));
    obs -= ({ find_object(VOID_OB), find_object(TEMP_OB), find_object(name) });
    if (sizeof(obs) > 1024 && !opt_force) {
        write(sprintf("共有 %d 个继承对象；如需编译，请指明 -f 参数。\n", sizeof(obs)));
        return 1;
    }

    // 销毁任何对象前保存路径和依赖，避免继承遍历依赖已失效对象。
    sources = ([ name: file ]);
    dependencies = ([ name: ({}) ]);
    virtuals = ({});
    foreach (ob in obs) {
        target = base_name(ob);
        if (virtualp(ob)) {
            virtuals += ({ target });
            continue;
        }
        sources[target] = lpc_file(target);
        if (!sources[target])
            return notify_fail("继承对象缺少源码，未开始更新：" + target + "。\n");
        dependencies[target] = map(inherit_list(ob), (: lpc_object_path($1) :));
    }
    pending = sort_array(keys(sources), 1);
    ordered = ({});
    while (sizeof(pending)) {
        ready = filter_array(pending, (: !sizeof($(dependencies)[$1] & $(pending)) :));
        if (!sizeof(ready)) return notify_fail("继承关系无法排序，未开始更新。\n");
        ordered += ready;
        pending -= ready;
    }
    ordered = map(ordered, (: $(sources)[$1] :)) + sort_array(virtuals, 1);
    if (sizeof(obs) > 100 && opt_compile) message_system("重新编译所有继承档案，请稍候...");
    foreach (target in ordered) {
        reset_eval_cost();
        if (opt_compile) {
            if (!update_one(target, opt_detail)) {
                write(sprintf("编译中止；此前成功更新 %d 个对象。\n", count));
                return 1;
            }
        } else if (opt_detail) write("需要编译 " + target + "。\n");
        count++;
    }
    write(sprintf("总共有 %d 个对象%s。\n", count, opt_compile ? "被成功编译" : "需要编译"));
    return 1;
}

int help(object me) {
    write(@HELP
指令格式：updatei <实体源码> [-c] [-d] [-f]

更新该源码及已加载的继承蓝图，支持 .c、.lpc 和无扩展名路径。
先更新实体依赖，再重建符合筛选的已加载虚拟蓝图；不枚举虚拟品种，
不更新玩家和克隆。虚拟路径不能作为实体继承根。

不带 -c 只预览；-d 显示详情；继承对象超过 1024 个时须明确指定 -f。
例如：updatei /inherit/armor/cloth -d
      updatei /inherit/armor/cloth -c -d

加载失败立即中止，不代表回滚。房间内容迁出失败时保留原对象；
重建失败时已迁出内容留在安全临时地点，需要管理员处理。
HELP);
    return 1;
}
