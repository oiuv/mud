// guilei.c
// by Smallfish

#include <ansi.h>

inherit F_CLEAN_UP;

int guilei_dir(object me, string dir, string type, int continueable, int *total);
int guilei_file(object me, string file, string type);

int main(object me, string arg) {
    string dir, type, type_name;
    int continueable;
    int *total = ({ 0 });

    seteuid(geteuid(me));

    if (!SECURITY_D->valid_grant(me, "(admin)"))
        return 0;

    write("文件归类。");

    continueable = 1;
    if (!arg || !(sscanf(arg, "%s %s", dir, type) == 2))
        return notify_fail("格式：guilei <路径> room|npc|obj \n");

    dir = resolve_path(me->query("cwd"), dir);

    if (dir[strlen(dir) - 1] != '/')
        dir += "/";

    if (file_size(dir) != -2)
        return notify_fail("没有" + dir + "这个路径。\n");

    //归类类型
    switch (type) {
        case "room":
            type_name = "房间";
            break;
        case "npc":
            type_name = "NPC";
            break;
        case "obj":
            type_name = "物品";
            break;
        default:
            return notify_fail("格式：guilei <路径> room|npc|obj \n");
    }

    me->set("cwd", dir);

    message_system("整理归类" + type_name + "档案中，请稍候...");
    if (!guilei_dir(me, dir, type, continueable, total)) {
        write(HIR "归类遇到错误中止。\n" NOR);
    }

    if (total[0] > 0) {
        write(HIC "总共有" + HIW + total[0] + HIC "个档案被成功归类！\n" NOR);
        write(HIC "归类信息存放在" + HIW + "/log/static/" + type + HIC "之中！\n" NOR);
    } else
        write(HIC "没有归类任何档案。\n" NOR);

    return 1;
}

int guilei_dir(object me, string dir, string type, int continueable, int *total) {
    string source, entry;
    int result, success, failed, skipped;

    if (!is_root(previous_object())) return 0;
    if (file_size(dir) != -2) return 0;
    write(HIY "开始检查目录" + dir + "下面的所有文件。\n" NOR);
    foreach (source in lpc_source_files(dir)) {
        reset_eval_cost();
        result = guilei_file(me, source, type);
        if (result > 0) {
            success++;
            total[0]++;
        } else if (result < 0) skipped++;
        else {
            failed++;
            if (!continueable) return 0;
        }
    }
    write(sprintf("目录 %s：归类成功 %d，失败 %d，跳过 %d。\n", dir, success, failed, skipped));
    foreach (entry in get_dir(dir)) {
        reset_eval_cost();
        if (entry == "tests" || (strlen(entry) && entry[0] == '.')) continue;
        if (file_size(dir + entry) == -2 &&
            !guilei_dir(me, dir + entry + "/", type, continueable, total) && !continueable)
            return 0;
    }
    return 1;
}

// 先完成一次对象的资料读取，再写该对象的记录，避免异常时留下半份结果。
private void record_object(object obj, string file, string type) {
    mapping all_obj;
    object item;
    string reference, records, equipment;

    if (type == "room") {
        records = "";
        all_obj = obj->query("objects");
        if (mapp(all_obj)) {
            foreach (reference in keys(all_obj)) {
                item = load_object(reference);
                if (!objectp(item)) error("无法加载房间引用：" + reference + "\n");
                records += sprintf("%s|%s|%s|%s|%s\n", file, obj->query("short"),
                    base_name(item), item->name(1), item->query("id"));
            }
        }
        if (records == "") records = sprintf("%s|%s|||\n", file, obj->query("short"));
        log_file("static/room", records);
    } else if (type == "npc") {
        records = sprintf("%s|%s|%s|%d|%d|%d|%d|%d|%d|%d|%d|%d|%d|%s|%s|%s\n",
            file, obj->query("id"), obj->query("name"), obj->query("combat_exp"),
            obj->query("jing"), obj->query("eff_jing"), obj->query("qi"), obj->query("eff_qi"),
            obj->query("jingli"), obj->query("max_jingli"), obj->query("neili"),
            obj->query("max_neili"), obj->query("shen"), obj->query("gender"),
            obj->query("race"), obj->query("family/family_name"));
        equipment = "";
        foreach (item in all_inventory(obj))
            equipment += sprintf("%s|%s|%s|%s\n", file, base_name(item),
                item->query("id"), item->name(1));
        all_obj = obj->query("vendor_goods");
        if (mapp(all_obj)) {
            foreach (reference in keys(all_obj)) {
                item = load_object(reference);
                if (!objectp(item)) error("无法加载货表引用：" + reference + "\n");
                equipment += sprintf("%s|%s|%s|%s\n", file, base_name(item),
                    item->query("id"), item->name(1));
            }
        }
        log_file("static/npc", records);
        if (equipment != "") log_file("static/npc_obj", equipment);
    } else {
        records = sprintf("%s|%s|%s|%d|%d\n", file, obj->query("id"),
            obj->query("name"), obj->query("value"), obj->query_weight());
        log_file("static/obj", records);
    }
}

// 1 为成功归类，0 为失败，-1 为不适用/处理程序；临时克隆始终清理。
int guilei_file(object me, string file, string type) {
    string document;
    int room, npc;
    object blueprint, obj, item;
    object *existing, *temporary;
    mixed err;

    if (lpc_object_path(file) == base_name(this_object())) return -1;
    document = read_file(file);
    if (!stringp(document)) return 0;
    room = strsrch(document, "inherit ROOM") >= 0;
    npc = strsrch(document, "inherit NPC") >= 0;
    if ((type == "room" && !room) || (type == "npc" && !npc) ||
        (type == "obj" && (room || npc))) return -1;
    if (member_array(type, ({ "room", "npc", "obj" })) == -1) return -1;
    err = catch(blueprint = load_object(file));
    if (!err && objectp(blueprint) && function_exists("create_virtual_object", blueprint)) {
        write("跳过虚拟处理程序：" + file + "\n");
        return -1;
    }
    if (!err && objectp(blueprint)) {
        if (type == "room") obj = blueprint;
        else {
            existing = children(file);
            err = catch(obj = new(file));
            // create() 抛错时，驱动可能保留尚未赋给 obj 的克隆。
            if (err) {
                temporary = children(file) - existing;
                foreach (obj in temporary) {
                    if (!objectp(obj) || !clonep(obj)) continue;
                    foreach (item in deep_inventory(obj)) if (objectp(item)) destruct(item);
                    destruct(obj);
                }
                obj = 0;
            }
        }
        if (!err && !objectp(obj)) err = "创建未返回对象";
        if (!err && objectp(obj)) err = catch(record_object(obj, file, type));
    }
    if (type != "room" && objectp(obj)) {
        foreach (item in deep_inventory(obj)) if (objectp(item)) destruct(item);
        destruct(obj);
    }
    if (err || !objectp(blueprint)) {
        write("归类失败：" + file + "\n");
        log_file("guilei", sprintf("%s\n%O\n", file, err || "未返回对象"));
        return 0;
    }
    // 成功路径中非房间临时对象已释放。
    write(".");
    return 1;
}

int help(object me) {
    write(@HELP
指令格式: guilei <目录> <room|npc|obj>

这个指令让你指定对一个目录及其子目录下的房间、人物、物品的
属性进行归类。
room参数表示归类房间文件，信息包括文件名、房间名、房间里的物
品文件名、物品中文名、物品英文名；
npc 参数表示归类人物文件，信息包括文件名、中文名、英文名、门
派ID、门派中文名、身上物品的文件名、物品ID、物品中文名、人物
的给项HP属性、人物的主要SCORE属性；
obj 参数表示归类物品文件，信息包括文件名、物品ID、物品中文名、
物品的价值等等；

扫描 .c/.lpc 源码，同名对象只检查一次。虚拟处理程序本身跳过，不枚举
品种；房间、NPC 装备及货表中实际引用的虚拟对象仍会记录无后缀身份。
非目标类型计为跳过，加载或读取失败单独计数，临时 NPC/物品会清理。
归类信息存放在/log/static目录下，错误详情在/log/guilei。

HELP);
    return 1;
}
